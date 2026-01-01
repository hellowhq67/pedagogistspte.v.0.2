import * as React from "react";
import Link from "next/link";
import {
  Mic,
  PenTool,
  BookOpen,
  Headphones,
  Home,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type SectionType = "speaking" | "writing" | "reading" | "listening";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  selectedSection: SectionType;
  selectedType: string | null;
  onSelectSection: (section: SectionType) => void;
  onSelectType: (type: any) => void;
}

const menuItems = {
  speaking: [
    { type: "read-aloud", title: "Read Aloud" },
    { type: "repeat-sentence", title: "Repeat Sentence" },
    { type: "describe-image", title: "Describe Image" },
    { type: "retell-lecture", title: "Re-tell Lecture" },
    { type: "answer-short-question", title: "Answer Short Question" },
    { type: "summarize-spoken-text", title: "Summarize Spoken Text" },
    { type: "read-and-retell", title: "Read and Retell" },
    { type: "summarize-group-discussion", title: "Summarize Group Discussion" },
    { type: "respond-to-situation", title: "Respond to Situation" },
  ],
  writing: [
    { type: "summarize-written-text", title: "Summarize Written Text" },
    { type: "write-essay", title: "Write Essay" },
    { type: "summarize-written-text-core", title: "Summarize Written Text (Core)" },
    { type: "write-email", title: "Write Email" },
  ],
  reading: [
    { type: "mc-single", title: "MC Single Answer" },
    { type: "mc-multiple", title: "MC Multiple Answers" },
    { type: "reorder-paragraphs", title: "Re-order Paragraphs" },
    { type: "fill-blanks-drag", title: "Fill in Blanks (Drag & Drop)" },
    { type: "fill-blanks-dropdown", title: "Fill in Blanks (Dropdown)" },
  ],
  listening: [
    { type: "summarize-spoken-text", title: "Summarize Spoken Text" },
    { type: "mc-single-listening", title: "MC Single Answer" },
    { type: "mc-multiple-listening", title: "MC Multiple Answers" },
    { type: "fill-blanks-listening", title: "Fill in Blanks" },
    { type: "highlight-correct-summary", title: "Highlight Correct Summary" },
    { type: "select-missing-word", title: "Select Missing Word" },
    { type: "highlight-incorrect-words", title: "Highlight Incorrect Words" },
    { type: "write-from-dictation", title: "Write from Dictation" },
  ],
};

const sections = [
  { id: "speaking", title: "Speaking", icon: Mic },
  { id: "writing", title: "Writing", icon: PenTool },
  { id: "reading", title: "Reading", icon: BookOpen },
  { id: "listening", title: "Listening", icon: Headphones },
];

export function AppSidebar({
  selectedSection,
  selectedType,
  onSelectSection,
  onSelectType,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/pte/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Home className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">PTE Practice</span>
                  <span className="truncate text-xs">AI Powered</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Sections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((section) => (
                <SidebarMenuItem key={section.id}>
                  <SidebarMenuButton
                    isActive={selectedSection === section.id}
                    onClick={() => onSelectSection(section.id as SectionType)}
                    tooltip={section.title}
                  >
                    <section.icon className="h-4 w-4" />
                    <span>{section.title}</span>
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="capitalize">{selectedSection} Tasks</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems[selectedSection]?.map((item) => (
                <SidebarMenuItem key={item.type}>
                  <SidebarMenuButton
                    isActive={selectedType === item.type}
                    onClick={() => onSelectType(item.type)}
                  >
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
