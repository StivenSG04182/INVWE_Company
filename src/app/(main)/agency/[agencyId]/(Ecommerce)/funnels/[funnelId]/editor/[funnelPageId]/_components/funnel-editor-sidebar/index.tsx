"use client"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useEditor } from "@/providers/editor/editor-provider"
import clsx from "clsx"
import TabList from "./tabs"
import SettingsTab from "./tabs/settings-tab"
import MediaBucketTab from "./tabs/media-bucket-tabs"
import ComponentsTab from "./tabs/components-tab"
import LayersTab from "./tabs/layers-tab"
import TemplatesTab from "./tabs/templates-tab"
import AnimationsTab from "./tabs/animations-tab"
import ThemesTab from "./tabs/themes-tab"
import HistoryTab from "./tabs/history-tab"
import AssetsTab from "./tabs/assets-tab"
import CodeTab from "./tabs/code-tab"
import ExtensionsTab from "./tabs/extensions-tab"
import AdvancedTab from "./tabs/advanced-tab"
import SystemTab from "./tabs/system-tab"
import FeaturesTab from "./tabs/features-tab"

type Props = {
    agencyId: string
}

const FunnelEditorSidebar = ({ agencyId }: Props) => {
    const { state } = useEditor()

    return (
        <Sheet
            open={true}
            modal={false}
        >
            <Tabs
                className="w-full "
                defaultValue="Settings"
            >
                <SheetContent
                    showX={false}
                    side="right"
                    className={clsx(
                        'mt-[155px] w-16 z-[80] shadow-none p-0 focus:border-none transition-all overflow-hidden',
                        { hidden: state.editor.previewMode }
                    )}
                >
                    <TabList />
                </SheetContent>
                <SheetContent
                    showX={false}
                    side="right"
                    className={clsx(
                        'mt-[155px] w-80 z-[40] shadow-none p-0 mr-16 bg-background h-full transition-all overflow-hidden',
                        { hidden: state.editor.previewMode }
                    )}
                >
                    <div className="grid gap-4 h-full pb-36 overflow-scroll">
                        <TabsContent value="Components" className="flex-1 m-0">
                            <ComponentsTab />
                        </TabsContent>

                        <TabsContent value="Settings" className="flex-1 m-0">
                            <SettingsTab />
                        </TabsContent>

                        <TabsContent value="Layers" className="flex-1 m-0">
                            <LayersTab />
                        </TabsContent>

                        <TabsContent value="Themes" className="flex-1 m-0">
                            <ThemesTab />
                        </TabsContent>

                        <TabsContent value="Media" className="flex-1 m-0">
                            <MediaBucketTab agencyId={agencyId} />
                        </TabsContent>

                        <TabsContent value="Templates" className="flex-1 m-0">
                            <TemplatesTab />
                        </TabsContent>

                        <TabsContent value="Animations" className="flex-1 m-0">
                            <AnimationsTab />
                        </TabsContent>

                        <TabsContent value="History" className="flex-1 m-0">
                            <HistoryTab />
                        </TabsContent>

                        <TabsContent value="Assets" className="flex-1 m-0">
                            <AssetsTab />
                        </TabsContent>

                        <TabsContent value="Code" className="flex-1 m-0">
                            <CodeTab />
                        </TabsContent>

                        <TabsContent value="Extensions" className="flex-1 m-0">
                            <ExtensionsTab />
                        </TabsContent>

                        <TabsContent value="Advanced" className="flex-1 m-0">
                            <AdvancedTab />
                        </TabsContent>

                        <TabsContent value="System" className="flex-1 m-0">
                            <SystemTab agencyId={agencyId} />
                        </TabsContent>

                        <TabsContent value="Features" className="flex-1 m-0">
                            <FeaturesTab />
                        </TabsContent>
                    </div>
                </SheetContent>
            </Tabs>
        </Sheet>
    )
}

export default FunnelEditorSidebar
