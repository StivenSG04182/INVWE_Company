import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Tipos de formatos de exportación soportados
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

// Interfaz para opciones de exportación
export interface ExportOptions {
    fileName: string;
    format: ExportFormat;
    title?: string;
    subtitle?: string;
    author?: string;
    // Opciones específicas para PDF
    pdfOptions?: {
        orientation?: 'portrait' | 'landscape';
        unit?: 'pt' | 'mm' | 'cm' | 'in';
        format?: string | [number, number]; // 'a4', 'letter', etc. o [width, height]
        compress?: boolean;
    };
}

// Función para exportar datos en diferentes formatos
export const exportData = (data: any[], options: ExportOptions) => {
    const { fileName, format } = options;

    switch (format) {
        case 'pdf':
            exportToPdf(data, options);
            break;
        case 'excel':
            exportToExcel(data, options);
            break;
        case 'csv':
            exportToCsv(data, options);
            break;
        case 'json':
            exportToJson(data, options);
            break;
        default:
            console.error('Formato de exportación no soportado');
    }
};

// Exportar a PDF
const exportToPdf = (data: any[], options: ExportOptions) => {
    const { fileName, title, subtitle, author, pdfOptions } = options;

    // Configurar opciones del PDF
    const orientation = pdfOptions?.orientation || 'portrait';
    const unit = pdfOptions?.unit || 'mm';
    const format = pdfOptions?.format || 'a4';

    // Crear documento PDF
    const doc = new jsPDF({
        orientation,
        unit,
        format,
        compress: pdfOptions?.compress,
    } as any);

    // Añadir metadatos
    if (author) {
        doc.setProperties({ author });
    }

    // Añadir título y subtítulo
    if (title) {
        doc.setFontSize(18);
        doc.text(title, 14, 22);
    }

    if (subtitle) {
        doc.setFontSize(12);
        doc.text(subtitle, 14, 30);
    }

    // Preparar datos para la tabla
    if (data.length > 0) {
        const headers = Object.keys(data[0]);
        const rows = data.map(item => headers.map(key => item[key]));

        // Añadir tabla al PDF
        (doc as any).autoTable({
            head: [headers],
            body: rows,
            startY: subtitle ? 35 : 25,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [66, 139, 202], textColor: 255 },
        });
    }

    // Guardar el PDF
    doc.save(`${fileName}.pdf`);
};

// Exportar a Excel
const exportToExcel = (data: any[], options: ExportOptions) => {
    const { fileName } = options;

    // Crear libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    // Generar archivo Excel y guardarlo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}.xlsx`);
};

// Exportar a CSV
const exportToCsv = (data: any[], options: ExportOptions) => {
    const { fileName } = options;

    // Convertir datos a CSV
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

    // Crear blob y guardar archivo
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${fileName}.csv`);
};

// Exportar a JSON
const exportToJson = (data: any[], options: ExportOptions) => {
    const { fileName } = options;

    // Convertir datos a string JSON
    const jsonString = JSON.stringify(data, null, 2);

    // Crear blob y guardar archivo
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, `${fileName}.json`);
};

// Función para preparar datos de tabla para exportación
export const prepareTableDataForExport = (data: any[], excludeColumns: string[] = []) => {
    return data.map(item => {
        const exportItem: any = {};

        Object.keys(item).forEach(key => {
            // Excluir columnas no deseadas
            if (!excludeColumns.includes(key)) {
                // Formatear valores especiales
                if (item[key] instanceof Date) {
                    exportItem[key] = item[key].toISOString().split('T')[0];
                } else if (typeof item[key] === 'object' && item[key] !== null) {
                    exportItem[key] = JSON.stringify(item[key]);
                } else {
                    exportItem[key] = item[key];
                }
            }
        });

        return exportItem;
    });
};