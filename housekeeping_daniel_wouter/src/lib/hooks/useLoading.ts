import { useState, useCallback } from "react";

export function useLoading<T = unknown>() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<T | undefined>(undefined);

    const setLoaded = useCallback((value: T | undefined) => {
        setData(value);
        setLoading(false);
    }, []);

    const reset = useCallback(() => {
        setLoading(true);
        setData(undefined);
    }, []);

    return { loading, data, setLoaded, reset };
}