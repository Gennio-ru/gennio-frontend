import { ModelJob } from "../modules/model-job";
import { Payment } from "../modules/payments";
import { MODEL_JOB_EVENTS } from "./model-job-events";
import { PAYMENT_EVENTS } from "./payment-events";

export type ServerToClientEvents = {
  [MODEL_JOB_EVENTS.UPDATE]: (job: ModelJob) => void;
  [PAYMENT_EVENTS.UPDATE]: (payment: Payment) => void;
};

export type ClientToServerEvents = {
  [MODEL_JOB_EVENTS.SUBSCRIBE]: (jobId: string) => void;
  [MODEL_JOB_EVENTS.UNSUBSCRIBE]: (jobId: string) => void;

  [PAYMENT_EVENTS.SUBSCRIBE]: (paymentId: string) => void;
  [PAYMENT_EVENTS.UNSUBSCRIBE]: (paymentId: string) => void;
};
