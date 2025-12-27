"use client";

import * as React from "react";
import {
  LayoutDashboard,
  BookOpen,
  Mic,
  FileText,
  Headphones,
  ClipboardList,
  History,
  Users,
  Bot,
  Video,
  BookMarked,
  TestTube2,
  ListChecks,
} from "lucide-react";

import { NavMainPTE } from "@/components/pte/nav-main-pte";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";

const navMain = [
  {
    title: "Overview",
    url: "/pte/dashboard",
    icon: LayoutDashboard,
    isActive: false,
  },
  {
    title: "Practice Hub",
    url: "/pte/practice",
    icon: BookOpen,
    isActive: true,
    items: [
      {
        title: "Speaking",
        url: "/pte/practice/speaking",
        items: [
          { title: "Read Aloud", url: "/pte/practice/speaking/read_aloud" },
          {
            title: "Repeat Sentence",
            url: "/pte/practice/speaking/repeat_sentence",
          },
          {
            title: "Describe Image",
            url: "/pte/practice/speaking/describe_image",
          },
          {
            title: "Retell Lecture",
            url: "/pte/practice/speaking/retell_lecture",
          },
          {
            title: "Answer Short Question",
            url: "/pte/practice/speaking/answer_short_question",
          },
          {
            title: "Respond to a Situation",
            url: "/pte/practice/speaking/respond_to_a_situation",
          },
          {
            title: "Summarize Group Discussion",
            url: "/pte/practice/speaking/summarize_group_discussion",
          },
        ],
      },
      {
        title: "Writing",
        url: "/pte/practice/writing",
        items: [
          {
            title: "Summarize Written Text",
            url: "/pte/practice/writing/summarize_written_text",
          },
          { title: "Essay", url: "/pte/practice/writing/essay" },
        ],
      },
      {
        title: "Reading",
        url: "/pte/practice/reading",
        items: [
          {
            title: "MC Single Answer",
            url: "/pte/practice/reading/reading_mc_single",
          },
          {
            title: "MC Multiple Answers",
            url: "/pte/practice/reading/reading_mc_multiple",
          },
          {
            title: "Re-order Paragraphs",
            url: "/pte/practice/reading/reorder_paragraphs",
          },
          {
            title: "FIB (Drag & Drop)",
            url: "/pte/practice/reading/reading_fill_blanks_drag",
          },
          {
            title: "FIB (Dropdown)",
            url: "/pte/practice/reading/reading_fill_blanks_dropdown",
          },
        ],
      },
      {
        title: "Listening",
        url: "/pte/practice/listening",
        items: [
          {
            title: "Summarize Spoken Text",
            url: "/pte/practice/listening/summarize_spoken_text",
          },
          {
            title: "MC Single Answer",
            url: "/pte/practice/listening/listening_mc_single",
          },
          {
            title: "MC Multiple Answers",
            url: "/pte/practice/listening/listening_mc_multiple",
          },
          {
            title: "Fill in the Blanks",
            url: "/pte/practice/listening/listening_fill_blanks",
          },
          {
            title: "Highlight Correct Summary",
            url: "/pte/practice/listening/highlight_correct_summary",
          },
          {
            title: "Select Missing Word",
            url: "/pte/practice/listening/select_missing_word",
          },
          {
            title: "Highlight Incorrect Words",
            url: "/pte/practice/listening/highlight_incorrect_words",
          },
          {
            title: "Write from Dictation",
            url: "/pte/practice/listening/write_from_dictation",
          },
        ],
      },
    ],
  },
  {
    title: "Mock Tests",
    url: "/pte/mock-tests",
    icon: TestTube2,
    items: [
      {
        title: "Full Mock Tests",
        url: "/pte/mock-tests",
      },
      {
        title: "Sectional Tests",
        url: "/pte/mock-tests/sectional",
      },
    ],
  },
  {
    title: "Test History",
    url: "/pte/academic/practice-attempts",
    icon: History,
  },
  {
    title: "Community",
    url: "/pte/community",
    icon: Users,
  },
  {
    title: "AI Agents",
    url: "/pte/ai-coach",
    icon: Bot,
  },
  {
    title: "Live Class",
    url: "/pte/study-center",
    icon: Video,
  },
  {
    title: "Resources",
    url: "/pte/templates",
    icon: BookMarked,
    items: [
      {
        title: "Templates",
        url: "/pte/templates",
      },
      {
        title: "Vocabulary",
        url: "/pte/vocab-books",
      },
      {
        title: "Shadowing",
        url: "/pte/shadowing",
      },
    ],
  },
];

export function PTEAppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/pte/dashboard">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Pedagogist</span>
                  <span className="truncate text-xs">AI Learning Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMainPTE items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
