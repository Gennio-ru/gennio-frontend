import { ModelJob } from "./model-job";

export const MODEL_JOB_EVENTS = {
  UPDATE: "model_job_update",
  SUBSCRIBE: "subscribe_model_job",
  UNSUBSCRIBE: "unsubscribe_model_job",
} as const;

export type ServerToClientEvents = {
  [MODEL_JOB_EVENTS.UPDATE]: (job: ModelJob) => void;
};

export type ClientToServerEvents = {
  [MODEL_JOB_EVENTS.SUBSCRIBE]: (jobId: string) => void;
  [MODEL_JOB_EVENTS.UNSUBSCRIBE]: (jobId: string) => void;
};
