import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { InfoPanel } from "@/components/ui/InfoPanel"

describe("InfoPanel", () => {
  it("renders content with base panel styles and merges className", () => {
    render(<InfoPanel className="custom-panel">Prazo sob consulta</InfoPanel>)

    const panel = screen.getByText("Prazo sob consulta")

    expect(panel).toBeInTheDocument()
    expect(panel).toHaveClass("rounded-[var(--radius-card)]")
    expect(panel).toHaveClass("border")
    expect(panel).toHaveClass("bg-white")
    expect(panel).toHaveClass("custom-panel")
  })
})
