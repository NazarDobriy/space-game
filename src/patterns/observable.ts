import { EventHandler } from "./types/observable.types";

export class Observable<T> {
  private observers: EventHandler<T>[] = [];

  subscribe(handler: EventHandler<T>): void {
    this.observers.push(handler);
  }

  unsubscribe(handler: EventHandler<T>): void {
    this.observers = this.observers.filter((observer: EventHandler<T>) => observer !== handler);
  }

  next(data: T): void {
    this.observers.forEach((observer: EventHandler<T>) => observer(data));
  }
}
