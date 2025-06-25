import html2canvas from "html2canvas"

export const generateEmailHTML = (elements: any[], templateName: string) => {
    const convertStylesToString = (styles: Record<string, string> = {}) => {
        return Object.entries(styles)
            .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
            .join("; ")
    }

    const convertElementToHTML = (element: any): string => {
        switch (element.type) {
            case "header":
                return `<h1 style="${convertStylesToString(element.styles)}">${element.content || ""}</h1>`
            case "text":
                return `<p style="${convertStylesToString(element.styles)}">${element.content || ""}</p>`
            case "image":
                return `<img src="${element.content?.src || ""}" alt="${element.content?.alt || ""}" style="${convertStylesToString(element.styles)}">`
            case "button":
                return `<a href="${element.content?.url || "#"}" style="${convertStylesToString(element.styles)}">${element.content?.text || "Button"}</a>`
            case "divider":
                return `<hr style="${convertStylesToString(element.styles)}">`
            case "spacer":
                return `<div style="height: ${element.styles?.height || "20px"}"></div>`
            case "section":
                return `<div style="${convertStylesToString(element.styles)}">${element.content?.elements?.map((el: any) => convertElementToHTML(el)).join("\n") || ""
                    }</div>`
            case "columns":
                return `<table width="100%" style="${convertStylesToString(element.styles)}"><tr>${element.content?.columns
                        ?.map(
                            (column: any) =>
                                `<td width="${column.width || "100%"}" style="${convertStylesToString(column.styles)}">${column.elements?.map((el: any) => convertElementToHTML(el)).join("\n") || ""
                                }</td>`,
                        )
                        .join("\n") || ""
                    }</tr></table>`
            default:
                return ""
        }
    }

    return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>${templateName}</title>
    <style>
      @media only screen and (max-width: 620px) {
        table.body h1 { font-size: 28px !important; margin-bottom: 10px !important; }
        table.body p, table.body ul, table.body ol, table.body td, table.body span, table.body a { font-size: 16px !important; }
        .container { padding: 0 !important; width: 100% !important; }
        .content { padding: 0 !important; }
      }
    </style>
  </head>
  <body style="background-color: #f6f6f6; margin: 0; padding: 0;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="width: 100%;">
      <tr>
        <td>&nbsp;</td>
        <td class="container" style="display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
          <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
            ${elements.map((element) => convertElementToHTML(element)).join("\n")}
          </div>
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>
  </body>
</html>`
}

export const generateTemplateThumbnail = async (elements: any[]) => {
    try {
        const emailCanvas = document.querySelector(".email-canvas")
        if (!emailCanvas) return null

        const canvas = await html2canvas(emailCanvas as HTMLElement, {
            scale: 0.5,
            width: 200,
            height: 120,
            backgroundColor: "#ffffff",
        })

        return canvas.toDataURL("image/png")
    } catch (error) {
        console.error("Error generando miniatura:", error)
        return null
    }
}
