"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  getWorkspacePanelOrder,
  type WorkspacePanelKey,
} from "@/lib/track-profile-routing";

type WorkspacePanelOrderControllerProps = {
  workspaceSlug: string;
};

export function WorkspacePanelOrderController({
  workspaceSlug,
}: WorkspacePanelOrderControllerProps) {
  const searchParams = useSearchParams();
  const profile = searchParams.get("profile");
  const intake = searchParams.get("intake");

  const orderedPanels = useMemo(
    () => getWorkspacePanelOrder(profile, intake),
    [intake, profile],
  );

  useEffect(() => {
    const container = document.querySelector<HTMLElement>(
      `[data-workspace-panel-container="${workspaceSlug}"]`,
    );
    if (!container) return;

    const panelNodes = container.querySelectorAll<HTMLElement>("[data-workspace-panel-key]");

    panelNodes.forEach((node) => {
      const panelKey = node.dataset.workspacePanelKey as WorkspacePanelKey | undefined;
      const orderIndex = panelKey ? orderedPanels.indexOf(panelKey) : -1;
      node.style.order = orderIndex >= 0 ? String(orderIndex) : String(orderedPanels.length + 1);
    });
  }, [orderedPanels, workspaceSlug]);

  return null;
}
