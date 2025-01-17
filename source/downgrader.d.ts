type Nullable<T> = { [K in keyof T]: T[K] | null | undefined };

type Dictionary<TValue> = {
    [key: string]: TValue;
}