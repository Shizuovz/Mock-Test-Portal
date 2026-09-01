import { describe, expect, it } from "vitest";
import { isAdmin, isEditorOrAdmin, userRoles } from "./roles";

describe("Role and Permission Guards", () => {
  it("recognizes all standard roles", () => {
    expect(userRoles).toEqual(["student", "editor", "admin"]);
  });

  it("evaluates admin permissions strictly", () => {
    expect(isAdmin("admin")).toBe(true);
    expect(isAdmin("editor")).toBe(false);
    expect(isAdmin("student")).toBe(false);
  });

  it("evaluates editor or admin privileges", () => {
    expect(isEditorOrAdmin("admin")).toBe(true);
    expect(isEditorOrAdmin("editor")).toBe(true);
    expect(isEditorOrAdmin("student")).toBe(false);
  });
});
