export abstract class BaseProcessor<T> {
  public abstract process(data: T): Promise<void>;
}
