import { BaseService } from "../base/BaseService"
import type { ITheme } from "@/types/models/design"

export class ThemeService extends BaseService<ITheme> {
    protected entityName = "Theme"

    async activate(themeId: string): Promise<ITheme> {
        try {
            // Implementación real
            return {} as ITheme
        } catch (error) {
            throw this.handleError(error)
        }
    }

    async preview(themeId: string): Promise<ITheme> {
        try {
            // Implementación real
            return {} as ITheme
        } catch (error) {
            throw this.handleError(error)
        }
    }

    async export(themeId: string): Promise<Blob> {
        try {
            // Implementación real
            return new Blob()
        } catch (error) {
            throw this.handleError(error)
        }
    }
}

