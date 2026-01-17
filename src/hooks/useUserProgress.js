import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useUserProgress() {
    const { user } = useAuth()
    const [progress, setProgress] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (user) {
            fetchProgress()
        } else {
            setProgress({})
            setLoading(false)
        }
    }, [user])

    async function fetchProgress() {
        if (!user) return

        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('user_progress')
                .select('phrase_id, total_repetitions')
                .eq('user_id', user.id)

            if (fetchError) throw fetchError

            // Convert array to object for easy lookup: { phraseId: count }
            const progressMap = {}
            data?.forEach(item => {
                progressMap[item.phrase_id] = item.total_repetitions
            })

            setProgress(progressMap)
        } catch (err) {
            console.error('Error fetching progress:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function updateProgress(phraseId, increment = 1) {
        if (!user) return

        try {
            const currentCount = progress[phraseId] || 0
            const newCount = currentCount + increment

            // Upsert (insert or update)
            const { error: upsertError } = await supabase
                .from('user_progress')
                .upsert({
                    user_id: user.id,
                    phrase_id: phraseId,
                    total_repetitions: newCount,
                    last_practiced_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,phrase_id'
                })

            if (upsertError) throw upsertError

            // Update local state
            setProgress(prev => ({
                ...prev,
                [phraseId]: newCount
            }))
        } catch (err) {
            console.error('Error updating progress:', err)
            setError(err.message)
        }
    }

    return {
        progress,
        loading,
        error,
        updateProgress,
        refetch: fetchProgress
    }
}
