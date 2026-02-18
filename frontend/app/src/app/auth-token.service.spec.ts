import { AuthTokenService } from "./auth-token.service";

describe("AuthTokenService", () => {
  let service: AuthTokenService;

  beforeEach(() => {
    service = new AuthTokenService();
    localStorage.clear();
  });

  it("getToken returns null when no token", () => {
    expect(service.getToken()).toBeNull();
  });

  it("setToken stores token", () => {
    service.setToken("abc");
    expect(localStorage.getItem("token")).toBe("abc");
    expect(service.getToken()).toBe("abc");
  });

  it("clearToken removes token", () => {
    localStorage.setItem("token", "abc");
    service.clearToken();
    expect(service.getToken()).toBeNull();
  });

  it("removeToken removes token (legacy key)", () => {
    localStorage.setItem("token", "abc");
    service.removeToken();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("isLoggedIn true when token exists", () => {
    localStorage.setItem("token", "abc");
    expect(service.isLoggedIn()).toBe(true);
  });

  it("isLoggedIn false when token missing", () => {
    expect(service.isLoggedIn()).toBe(false);
  });
});
