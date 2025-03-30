/* import type { IEntity } from "./base"

export interface ITheme extends IEntity {
    name: string
    description: string
    colors: IColorPalette
    typography: ITypography
    spacing: ISpacing
    components: Record<string, IComponentStyle>
    status: ThemeStatus
}

export interface ITemplate extends IEntity {
    name: string
    description: string
    type: TemplateType
    content: string
    thumbnail: string
    category: string
    tags: string[]
    status: TemplateStatus
}

export interface IColorPalette {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    error: string
    text: {
        primary: string
        secondary: string
        disabled: string
    }
}

export interface ITypography {
    fontFamily: {
        primary: string
        secondary: string
    }
    fontSize: {
        xs: string
        sm: string
        base: string
        lg: string
        xl: string
        "2xl": string
    }
    fontWeight: {
        light: number
        normal: number
        medium: number
        semibold: number
        bold: number
    }
}

export interface ISpacing {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
}

export interface IComponentStyle {
    backgroundColor?: string
    color?: string
    padding?: string
    margin?: string
    borderRadius?: string
    border?: string
    boxShadow?: string
    [key: string]: string | undefined
}

export enum ThemeStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    DRAFT = "DRAFT",
}

export enum TemplateType {
    PAGE = "PAGE",
    EMAIL = "EMAIL",
    COMPONENT = "COMPONENT",
}

export enum TemplateStatus {
    PUBLISHED = "PUBLISHED",
    DRAFT = "DRAFT",
    ARCHIVED = "ARCHIVED",
}

 */