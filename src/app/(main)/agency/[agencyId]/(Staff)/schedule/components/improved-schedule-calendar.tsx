"use client"

import React from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Button, Modal, Form, Input, Select } from "antd"
import { MailOutlined } from "@ant-design/icons"
import { generatePDF } from "./pdf-generator"
import { checkOverlap } from "./overlap-checker"
import { getVacationDays } from "./vacation-days"
import { applyTemplate } from "./template-applier"
import { analyzeDashboard } from "./dashboard-analyzer"

const localizer = momentLocalizer(moment)

interface Event {
    title: string
    start: Date | null
    end: Date
    type: string
}

const ImprovedScheduleCalendar = () => {
    const [events, setEvents] = React.useState<Event[]>([])
    const [modalVisible, setModalVisible] = React.useState(false)
    const [selectedDay, setSelectedDay] = React.useState<Date | null>(null)
    const [vacationDays, setVacationDays] = React.useState(0)
    const [selectedTemplate, setSelectedTemplate] = React.useState<any>(null)

    const handleSelect = ({ start }) => {
        setSelectedDay(start)
        setModalVisible(true)
    }

    const handleModalClose = () => {
        setModalVisible(false)
    }

    const handleRegisterHours = (values) => {
        if (!selectedDay) return
        
        const newEvent = {
            title: `Horas ${values.type}`,
            start: selectedDay,
            end: moment(selectedDay).add(values.hours, "hours").toDate(),
            type: values.type,
        }

        if (checkOverlap(events, newEvent)) {
            alert("Horas solapan con otro evento")
            return
        }

        setEvents([...events, newEvent])
        handleModalClose()
    }

    const handleApplyTemplate = () => {
        if (!selectedDay) return
        
        const templateEvents = applyTemplate(selectedTemplate, selectedDay)
        setEvents([...events, ...templateEvents])
    }

    const handleGenerateReport = () => {
        generatePDF(events)
    }

    const handleAnalyzeDashboard = () => {
        analyzeDashboard(events)
    }

    const handleSendNotification = () => {
        alert("Notificación enviada por email")
    }

    React.useEffect(() => {
        setVacationDays(getVacationDays())
    }, [])

    return (
        <div>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectSlot={handleSelect}
                selectable
                style={{ height: 500 }}
            />
            <div className="modal" style={{ display: modalVisible ? 'block' : 'none' }}>
                <div className="modal-content">
                    <h3>Registrar Horas</h3>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        handleRegisterHours({
                            type: formData.get('type'),
                            hours: parseInt(formData.get('hours') as string)
                        })
                    }}>
                        <div>
                            <label>Tipo de Horas:</label>
                            <select name="type" required>
                                <option value="normales">Normales</option>
                                <option value="extras">Extras</option>
                                <option value="nocturnas">Nocturnas</option>
                            </select>
                        </div>
                        <div>
                            <label>Número de Horas:</label>
                            <input type="number" name="hours" required />
                        </div>
                        <div>
                            <button type="button" onClick={handleModalClose}>Cancelar</button>
                            <button type="submit">Registrar</button>
                        </div>
                    </form>
                </div>
            </div>
            <button onClick={handleGenerateReport}>Generar Reporte PDF</button>
            <button onClick={handleAnalyzeDashboard}>Ver Dashboard Analítico</button>
            <button onClick={handleSendNotification}>
                <MailOutlined /> Enviar Notificación
            </button>
            <button onClick={handleApplyTemplate}>Aplicar Plantilla</button>
            <div>
                <h2>Días de Vacaciones Disponibles: {vacationDays}</h2>
            </div>
        </div>
    )
}

export default ImprovedScheduleCalendar
