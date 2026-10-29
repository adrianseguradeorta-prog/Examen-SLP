import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  configured: vi.fn(),
  database: vi.fn(),
  getUser: vi.fn(),
}));
vi.mock("../src/lib/supabase", () => ({
  configured: mocks.configured,
  database: mocks.database,
}));
import { practiceIdentity } from "../src/lib/practice-identity";
beforeEach(() => {
  vi.resetAllMocks();
  mocks.database.mockResolvedValue({ auth: { getUser: mocks.getUser } });
});
it("works as guest without constructing any cloud client when unconfigured", async () => {
  mocks.configured.mockReturnValue(false);
  expect(await practiceIdentity()).toEqual({ local: true, owner: "guest" });
  expect(mocks.database).not.toHaveBeenCalled();
});
it("uses verified identity, and never uses a remembered private owner on auth failure", async () => {
  mocks.configured.mockReturnValue(true);
  mocks.getUser.mockResolvedValue({
    data: { user: { id: "alice" } },
    error: null,
  });
  expect(await practiceIdentity()).toEqual({ local: false, owner: "alice" });
  mocks.getUser.mockRejectedValue(Error("offline"));
  expect(await practiceIdentity()).toEqual({ local: false, owner: null });
});
