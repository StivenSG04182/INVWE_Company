import type { ContentMap } from "@/app/api/client/types/content"

export const pageContent: ContentMap = {
    "/overview/dashboard": {
        title: "Dashboard",
        description: "Overview of your store's performance",
        stats: [
            { label: "Total Sales", value: "$24,563", change: 12 },
            { label: "Active Users", value: 2453, change: -2 },
            { label: "New Orders", value: 45, change: 5 },
        ],
    },
    "/overview/analytics": {
        title: "Analytics",
        description: "Detailed analysis of your store's metrics",
        stats: [
            { label: "Conversion Rate", value: "2.4%", change: 0.5 },
            { label: "Avg. Order Value", value: "$85", change: 3 },
        ],
    },
    "/store/products": {
        title: "Products",
        description: "Manage your product catalog",
        content: [
            { title: "Active Products", description: "Currently listed products: 234" },
            { title: "Out of Stock", description: "Products needing restock: 12" },
        ],
    },
    "/store/customers": {
        title: "Customers",
        description: "View and manage customer information",
        stats: [
            { label: "Total Customers", value: 1234 },
            { label: "New This Month", value: 56 },
        ],
    },
    "/store/discounts": {
        title: "Discounts",
        description: "Manage promotional offers and discounts",
        content: [
            { title: "Active Promotions", description: "Running campaigns: 5" },
            { title: "Scheduled", description: "Upcoming promotions: 3" },
        ],
    },
    "/store/licenses": {
        title: "Licenses",
        description: "Manage product licenses and keys",
        stats: [
            { label: "Active Licenses", value: 892 },
            { label: "Expiring Soon", value: 23 },
        ],
    },
    "/emails/campaigns": {
        title: "Email Campaigns",
        description: "Create and manage email marketing campaigns",
        stats: [
            { label: "Open Rate", value: "24.5%" },
            { label: "Click Rate", value: "3.2%" },
        ],
    },
    "/emails/inbox": {
        title: "Inbox",
        description: "Manage customer communications",
        content: [
            { title: "Unread Messages", description: "15 new messages" },
            { title: "Requiring Response", description: "8 pending replies" },
        ],
    },
    "/emails/archives": {
        title: "Email Archives",
        description: "Access past email communications",
        stats: [
            { label: "Archived Threads", value: 1543 },
            { label: "Storage Used", value: "2.3 GB" },
        ],
    },
    "/reports/sales": {
        title: "Sales Reports",
        description: "Detailed sales analytics and trends",
        stats: [
            { label: "Monthly Revenue", value: "$45,678" },
            { label: "YOY Growth", value: "15%" },
        ],
    },
    "/reports/analytics": {
        title: "Analytics Reports",
        description: "In-depth performance metrics",
        content: [
            { title: "Traffic Sources", description: "Top source: Organic Search" },
            { title: "User Behavior", description: "Avg. session: 4.5 minutes" },
        ],
    },
    "/reports/performance": {
        title: "Performance Reports",
        description: "System and application performance metrics",
        stats: [
            { label: "Uptime", value: "99.9%" },
            { label: "Response Time", value: "0.3s" },
        ],
    },
    "/design/themes": {
        title: "Themes",
        description: "Customize your store's appearance",
        content: [
            { title: "Active Theme", description: "Modern Commerce 2.0" },
            { title: "Available Themes", description: "15 themes ready to use" },
        ],
    },
    "/design/templates": {
        title: "Templates",
        description: "Manage page and email templates",
        content: [
            { title: "Page Templates", description: "8 custom templates" },
            { title: "Email Templates", description: "12 responsive designs" },
        ],
    },
    "/settings/security": {
        title: "Security Settings",
        description: "Manage security preferences",
        content: [
            { title: "Two-Factor Auth", description: "Enabled for 15 users" },
            { title: "Access Logs", description: "Last 30 days activity" },
        ],
    },
    "/settings/notifications": {
        title: "Notification Settings",
        description: "Configure system notifications",
        content: [
            { title: "Email Alerts", description: "5 active triggers" },
            { title: "Push Notifications", description: "3 channels configured" },
        ],
    },
    "/settings/team": {
        title: "Team Settings",
        description: "Manage team members and permissions",
        stats: [
            { label: "Active Members", value: 12 },
            { label: "Pending Invites", value: 3 },
        ],
    },
}

