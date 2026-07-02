interface TrackEventPayload {
  event: string;
  [key: string]: string | undefined;
}

export function trackEvent(event: string, data?: Record<string, string>): void {
  const payload: TrackEventPayload = {
    event,
    ...data,
  };
  console.log('track_event', payload);
}
