import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePhrases() {
    const [phrases, setPhrases] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchPhrases()
    }, [])

    async function fetchPhrases() {
        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('phrases')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true })

            if (fetchError) throw fetchError

            setPhrases(data || [])
        } catch (err) {
            console.error('Error fetching phrases:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return { phrases, loading, error, refetch: fetchPhrases }
}
