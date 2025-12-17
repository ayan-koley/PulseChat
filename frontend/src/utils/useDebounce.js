import { useEffect, useState } from "react"

export const useDebounce = (value, delay=300) => {
    const [debounceValue, setDebouceValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouceValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay])
    
    return debounceValue;
}