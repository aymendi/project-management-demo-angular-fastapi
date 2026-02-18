import { TestBed } from "@angular/core/testing";
import { Apollo } from "apollo-angular";
import { of, throwError } from "rxjs";
import { Router } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { LoginComponent } from "./login.component"; 
import { AuthTokenService } from "../../auth-token.service";

describe("LoginComponent", () => {
  const apolloMock = {
    mutate: jest.fn(),
  };

  const tokenServiceMock = {
    setToken: jest.fn(),
  };

  const routerMock = {
    navigateByUrl: jest.fn(),
  };

  beforeEach(async () => {  
    await TestBed.configureTestingModule({
      imports: [LoginComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Apollo, useValue: apolloMock },
        { provide: AuthTokenService, useValue: tokenServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    jest.clearAllMocks();
    localStorage.clear();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("submit should mark all as touched and NOT call mutate when form invalid", () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;

    const markSpy = jest.spyOn(comp.form, "markAllAsTouched");

    comp.form.patchValue({ username: "", password: "" });
    comp.submit();

    expect(markSpy).toHaveBeenCalled();
    expect(apolloMock.mutate).not.toHaveBeenCalled();
  });

  it("submit should call mutate with trimmed username when valid", () => {
    apolloMock.mutate.mockReturnValue(
      of({
        data: {
          login: { token: "t123", user: { id: "1", username: "u", role: "USER" } },
        },
      })
    );

    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;

    comp.form.patchValue({ username: "  aymen  ", password: "pass" });
    comp.submit();

    expect(apolloMock.mutate).toHaveBeenCalledTimes(1);
    const args = apolloMock.mutate.mock.calls[0][0];
    expect(args.variables).toEqual({ username: "aymen", password: "pass" });
  });

  it("on success should set token, store role, and navigate to /products", () => {
    apolloMock.mutate.mockReturnValue(
      of({
        data: {
          login: { token: "t123", user: { id: "1", username: "u", role: "ADMIN" } },
        },
      })
    );

    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;

    comp.form.patchValue({ username: "u", password: "p" });
    comp.submit();

    expect(tokenServiceMock.setToken).toHaveBeenCalledWith("t123");
    expect(localStorage.getItem("role")).toBe("ADMIN");
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith("/products");
    expect(comp.loading).toBe(false);
    expect(comp.error).toBeNull();
  });

  it("if token missing should set error 'Login failed' and NOT navigate", () => {
    apolloMock.mutate.mockReturnValue(
      of({
        data: { login: { token: null, user: { id: "1", username: "u", role: "USER" } } },
      })
    );

    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.form.patchValue({ username: "u", password: "p" });
    comp.submit();

    expect(comp.error).toBe("Login failed");
    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    expect(tokenServiceMock.setToken).not.toHaveBeenCalled();
  });

  it("on GraphQL error should extract graphQLErrors[0].message", () => {
    apolloMock.mutate.mockReturnValue(
      throwError(() => ({ graphQLErrors: [{ message: "Invalid credentials" }] }))
    );

    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.form.patchValue({ username: "u", password: "bad" });
    comp.submit();

    expect(comp.loading).toBe(false);
    expect(comp.error).toBe("Invalid credentials");
  });

  it("on network error should extract networkError.message", () => {
    apolloMock.mutate.mockReturnValue(
      throwError(() => ({ networkError: { message: "Network down" } }))
    );

    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.form.patchValue({ username: "u", password: "p" });
    comp.submit();

    expect(comp.error).toBe("Network down");
  });

  it("on generic error should fallback to message or default", () => {
    apolloMock.mutate.mockReturnValue(throwError(() => ({ message: "Boom" })));

    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.form.patchValue({ username: "u", password: "p" });
    comp.submit();

    expect(comp.error).toBe("Boom");
  });
});
