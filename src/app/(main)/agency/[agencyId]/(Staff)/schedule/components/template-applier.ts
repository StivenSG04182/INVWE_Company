export const applyTemplate = (template: any, selectedDay: Date): any[] => {
    // Mock implementation for applying schedule templates
    // In a real implementation, this would load predefined templates
    // and apply them to the selected day
    
    if (!template || !selectedDay) {
        return []
    }
    
    // Mock template events
    const templateEvents = [
        {
            title: 'Horas Normales',
            start: new Date(selectedDay),
            end: new Date(new Date(selectedDay).getTime() + 8 * 60 * 60 * 1000), // 8 hours
            type: 'normales'
        }
    ]
    
    return templateEvents
} 