import { Kafka, Producer, RecordMetadata } from 'kafkajs';
import { env } from '../config/env';

let producer: Producer | null = null;

export async function initKafkaProducer(): Promise<void> {
  if (!env.kafkaBrokers) {
    // eslint-disable-next-line no-console
    console.warn('KAFKA_BROKERS not configured, Kafka producer will not be initialized');
    return;
  }

  const brokers = env.kafkaBrokers.split(',').map(b => b.trim());
  const kafka = new Kafka({
    clientId: 'scmtp-user-service',
    brokers: brokers,
    retry: {
      initialRetryTime: 100,
      retries: 8,
    },
  });

  producer = kafka.producer({
    allowAutoTopicCreation: true,
    transactionTimeout: 30000,
  });

  try {
    await producer.connect();
    // eslint-disable-next-line no-console
    console.log('Kafka producer connected successfully', { brokers });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect Kafka producer:', error);
    // Don't throw - allow service to run without Kafka in dev mode
    if (env.nodeEnv === 'production') {
      throw error;
    }
  }
}

export async function disconnectKafkaProducer(): Promise<void> {
  if (producer) {
    try {
      await producer.disconnect();
      producer = null;
      // eslint-disable-next-line no-console
      console.log('Kafka producer disconnected');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error disconnecting Kafka producer:', error);
    }
  }
}

export interface UserEventPayload {
  userId: string;
  email: string;
  name?: string;
  phone?: string;
}

export async function publishUserEvent(
  eventType: 'UserRegistered' | 'UserUpdated' | 'UserDeleted',
  payload: UserEventPayload
): Promise<RecordMetadata[] | void> {
  if (!producer) {
    // eslint-disable-next-line no-console
    console.warn('Kafka producer not initialized, skipping event', { eventType, payload });
    return;
  }

  const topic = 'user-events';

  try {
    const result = await producer.send({
      topic,
      messages: [
        {
          key: payload.userId,
          value: JSON.stringify({
            eventId: `${payload.userId}-${Date.now()}`,
            type: eventType,
            occurredAt: new Date().toISOString(),
            payload: {
              userId: payload.userId,
              email: payload.email,
              name: payload.name,
              phone: payload.phone,
            },
          }),
          headers: {
            'event-type': eventType,
          },
        },
      ],
    });
    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to publish user event to Kafka:', error);
    throw error;
  }
}

