/* import { BaseService } from "../base/BaseService"
import type { IEmailCampaign } from "@/types/models/email"

export class EmailCampaignService extends BaseService<IEmailCampaign> {
    protected entityName = "EmailCampaign"

    async schedule(campaignId: string, date: Date): Promise<IEmailCampaign> {
        try {
            // Implementación cambiar
            return {} as IEmailCampaign
        } catch (error) {
            throw this.handleError(error)
        }
    }

    async send(campaignId: string): Promise<boolean> {
        try {
            // Implementación cambiar
            return true
        } catch (error) {
            throw this.handleError(error)
        }
    }

    async getStatistics(campaignId: string): Promise<IEmailCampaign["statistics"]> {
        try {
            // Implementación cambiar
            return {
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0,
                bounced: 0,
                unsubscribed: 0,
            }
        } catch (error) {
            throw this.handleError(error)
        }
    }
}

 */