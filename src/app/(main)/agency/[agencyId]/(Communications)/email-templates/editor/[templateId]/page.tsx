import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import BlurPage from "@/components/global/blur-page"
import EmailTemplateEditor from "@/components/email-editor/email-template-editor"
import { EmailEditorProvider } from "@/providers/email-editor/email-editor-provider"

const EmailTemplateEditorPage = async ({
    params
}: {
    params: { agencyId: string; templateId: string }
}) => {
    const user = await getAuthUserDetails()
    if (!user) return redirect("/sign-in")

    const agencyId = params.agencyId
    const templateId = params.templateId

    if (!user.Agency) {
        return redirect("/agency")
    }

    const isNewTemplate = templateId === "new"

    return (
        <BlurPage>
            <EmailEditorProvider>
                <EmailTemplateEditor
                    agencyId={agencyId}
                    templateId={templateId}
                    isNewTemplate={isNewTemplate}
                />
            </EmailEditorProvider>
        </BlurPage>
    )
}

export default EmailTemplateEditorPage
