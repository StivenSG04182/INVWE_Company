export const checkOverlap = (existingEvents: any[], newEvent: any): boolean => {
    if (!newEvent.start || !newEvent.end) {
        return false
    }
    
    const newStart = new Date(newEvent.start)
    const newEnd = new Date(newEvent.end)
    
    return existingEvents.some(event => {
        if (!event.start || !event.end) return false
        
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        
        // Check if the new event overlaps with any existing event
        return (newStart < eventEnd && newEnd > eventStart)
    })
} 