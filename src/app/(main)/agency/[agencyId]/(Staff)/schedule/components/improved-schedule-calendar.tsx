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

const ImprovedScheduleCalendar = () => {
    const [events, setEvents] = React.useState([])
    const [modalVisible, setModalVisible] = React.useState(false)
    const [selectedDay, setSelectedDay] = React.useState(null)
    const [vacationDays, setVacationDays] = React.useState(0)
    const [selectedTemplate, setSelectedTemplate] = React.useState(null)

    const handleSelect = ({ start }) => {
        setSelectedDay(start)
        setModalVisible(true)
    }

    const handleModalClose = () => {
        setModalVisible(false)
    }

    const handleRegisterHours = (values) => {
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
            <Modal
                title="Registrar Horas"
                visible={modalVisible}
                onCancel={handleModalClose}
                footer={[
                    <Button key="back" onClick={handleModalClose}>
                        Cancelar
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleRegisterHours}>
                        Registrar
                    </Button>,
                ]}
            >
                <Form onFinish={handleRegisterHours}>
                    <Form.Item
                        label="Tipo de Horas"
                        name="type"
                        rules={[{ required: true, message: "Por favor selecciona el tipo de horas" }]}
                    >
                        <Select>
                            <Select.Option value="normales">Normales</Select.Option>
                            <Select.Option value="extras">Extras</Select.Option>
                            <Select.Option value="nocturnas">Nocturnas</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Número de Horas"
                        name="hours"
                        rules={[{ required: true, message: "Por favor ingresa el número de horas" }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                </Form>
            </Modal>
            <Button onClick={handleGenerateReport}>Generar Reporte PDF</Button>
            <Button onClick={handleAnalyzeDashboard}>Ver Dashboard Analítico</Button>
            <Button onClick={handleSendNotification}>
                <MailOutlined /> Enviar Notificación
            </Button>
            <Button onClick={handleApplyTemplate}>Aplicar Plantilla</Button>
            <div>
                <h2>Días de Vacaciones Disponibles: {vacationDays}</h2>
            </div>
        </div>
    )
}

export default ImprovedScheduleCalendar
