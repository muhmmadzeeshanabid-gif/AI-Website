/**
 * Checks if a thrown error is a localStorage quota exceeded error.
 */
export function isQuotaExceededError(err) {
  return (
    err &&
    (err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err.code === 22 ||
      err.code === 1014 ||
      err.message?.includes('quota') ||
      err.message?.includes('exceeded') ||
      err.message?.includes('Quota'))
  );
}

/**
 * Safely saves a key-value pair to localStorage with automatic pruning logic if quota is exceeded.
 * Returns the final object/array that was successfully saved (if it was pruned or modified), or null if saving failed completely.
 */
export function safeSetLocalStorageItem(key, data) {
  if (typeof window === 'undefined') return null;

  const serialized = typeof data === 'string' ? data : JSON.stringify(data);
  try {
    localStorage.setItem(key, serialized);
    return data;
  } catch (error) {
    if (isQuotaExceededError(error)) {
      console.warn(`Storage quota exceeded for key "${key}". Attempting to free space...`);

      // Check if this key is a user-scoped images key
      const isMyImagesKey = key === 'aura-my-images' || key.startsWith('aura-my-images-');

      // 1. Pruning user-scoped or legacy image keys
      if (isMyImagesKey) {
        const items = typeof data === 'string' ? JSON.parse(data) : data;
        if (Array.isArray(items)) {
          let pruneList = [...items];
          let attempts = 0;
          while (pruneList.length > 8 && attempts < 100) {
            attempts++;
            const lastGenIdx = pruneList
              .map((x, idx) => ({ id: x.id, idx }))
              .reverse()
              .find(x => x.id?.startsWith('img-gen-') || x.id?.startsWith('img-gen-aspect-'))?.idx;

            if (lastGenIdx !== undefined) {
              pruneList.splice(lastGenIdx, 1);
              try {
                localStorage.setItem(key, JSON.stringify(pruneList));
                console.log("Successfully resolved quota error by pruning images key:", key);
                return pruneList;
              } catch (innerErr) {
                // Try next pruning iteration
              }
            } else {
              break;
            }
          }
        }
      }

      // 2. Pruning aura-chats
      if (key === 'aura-chats') {
        const chatsList = typeof data === 'string' ? JSON.parse(data) : data;
        if (Array.isArray(chatsList)) {
          let prunedChats = chatsList.map(chat => ({
            ...chat,
            messages: chat.messages ? [...chat.messages] : []
          }));

          let attempts = 0;
          while (attempts < 20) {
            attempts++;
            let clearedAny = false;
            // Iterate backwards to clear base64 data URLs in older chats first
            for (let i = prunedChats.length - 1; i >= 0; i--) {
              const chat = prunedChats[i];
              if (chat.messages) {
                for (let j = 0; j < chat.messages.length; j++) {
                  const msg = chat.messages[j];
                  if (msg.imageUrl && msg.imageUrl.startsWith('data:image/')) {
                    msg.imageUrl = ''; // Clear base64 data to save space
                    clearedAny = true;
                    break;
                  }
                }
              }
              if (clearedAny) break;
            }

            if (clearedAny) {
              try {
                localStorage.setItem(key, JSON.stringify(prunedChats));
                console.log("Successfully resolved quota error by clearing base64 image data from old chats.");
                return prunedChats;
              } catch (innerErr) {
                // Try next iteration
              }
            } else {
              break;
            }
          }
        }
      }

      // 3. Emergency Cleanup: clear generated images from ALL user-scoped image keys to fit other keys
      if (!isMyImagesKey) {
        try {
          // Find all user-scoped image keys
          const keysToClean = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && (k === 'aura-my-images' || k.startsWith('aura-my-images-'))) {
              keysToClean.push(k);
            }
          }
          let freed = false;
          for (const imgKey of keysToClean) {
            try {
              const savedMyImages = localStorage.getItem(imgKey);
              if (savedMyImages) {
                const items = JSON.parse(savedMyImages);
                const pruned = items.filter(x => !x.id?.startsWith('img-gen-') && !x.id?.startsWith('img-gen-aspect-'));
                localStorage.setItem(imgKey, JSON.stringify(pruned));
                freed = true;
              }
            } catch (_) {}
          }
          if (freed) {
            try {
              localStorage.setItem(key, serialized);
              console.log(`Successfully saved key "${key}" after emergency cleanup of image keys.`);
              return data;
            } catch (innerErr) {
              // Still fails
            }
          }
        } catch (emergencyErr) {
          console.error("Emergency cleanup of other keys failed:", emergencyErr);
        }
      }
    }

    // Fail gracefully with a warning
    console.warn(`Failed to write to localStorage for key "${key}":`, error);
    return null;
  }
}
