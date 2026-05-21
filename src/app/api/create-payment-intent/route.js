import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { amount, planName } = await request.json();

    if (amount === 0) {
      // Create a SetupIntent for free trials/free plans (no charge today)
      const setupIntent = await stripe.setupIntents.create({
        payment_method_types: ['card'],
        description: `Setup payment details for ${planName} free trial`,
        metadata: { planName },
      });
      return NextResponse.json({
        clientSecret: setupIntent.client_secret,
        isSetupIntent: true
      });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'pkr',
      description: `Subscription payment for ${planName}`,
      metadata: {
        planName,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      isSetupIntent: false
    });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
