export class CachingDictionary<TKey, TValue> {
    private cache: [TKey, TValue][];
    private map: Map<TKey, number>
    
    constructor(
        private readonly maxLength: number
    ) {
        this.cache = []
        this.map = new Map<TKey, number>();
    }
    
    public add(key: TKey, value: TValue) {
        if (value === undefined) {
            return;
        }
        
        this.cache.push([key, value]);
        
        this.ensureSize();
    }
    
    private ensureSize() {
        if (this.cache.length <= this.maxLength) {
            return;
        }
        
        const popAmount = this.cache.length - this.maxLength;
        for (let i = 0; i < popAmount; i++) {
            this.cache.pop()
        }
    }
    
    public remove(removingKey: TKey) {
        this.cache.splice(
            this.cache.findIndex(
                ([key,  value]) => key === removingKey
            ),
            1
        );
    }
    
    public isCached(key: TKey): boolean {
        return this.cache.some(value => value[0] === key)
    }
    
    public getValue(key: TKey): TValue|undefined {
        const value = this.cache.find(value1 => value1[0] === key);
        
        if (!value) {
            return undefined;
        }
        
        this.remove(key);
        this.add(key, value[1]);
        
        return value[1];
    }
    
    public remember(key: TKey, valueFunc: () => TValue) {
        if (this.isCached(key)) {
            return this.getValue(key);
        }
        
        const value = valueFunc();
        this.add(key, value);
        
        return value;
    }

    public async rememberAsync(key: TKey, valueFunc: () => TValue): Promise<TValue|undefined> {
        if (this.isCached(key)) {
            return this.getValue(key);
        }

        const value = await valueFunc();
        this.add(key, value);

        return value;
    }
}