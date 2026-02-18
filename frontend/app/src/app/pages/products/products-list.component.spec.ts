import { TestBed } from "@angular/core/testing";
import { of, Subject, throwError } from "rxjs";
import { Apollo } from "apollo-angular";
import { ProductsListComponent } from "./products-list.component";
import { TranslateModule } from "@ngx-translate/core";

describe("ProductsListComponent", () => {
  let apolloMock: {
    watchQuery: jest.Mock;
    mutate: jest.Mock;
  };

  // simulate QueryRef.valueChanges stream
  let valueChanges$: Subject<any>;
  let queryRefMock: any;

  beforeEach(async () => {
    valueChanges$ = new Subject<any>();

    queryRefMock = {
      valueChanges: valueChanges$.asObservable(),
      refetch: jest.fn().mockResolvedValue(true),
    };

    apolloMock = {
      watchQuery: jest.fn().mockReturnValue(queryRefMock),
      mutate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        ProductsListComponent,
        // we don't need real translations for unit tests
        TranslateModule.forRoot(),
      ],
      providers: [{ provide: Apollo, useValue: apolloMock }],
    }).compileComponents();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should create and setup streams on init", () => {
    const fixture = TestBed.createComponent(ProductsListComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(apolloMock.watchQuery).toHaveBeenCalledTimes(1);
  });

  it("products$ should map backend data correctly", (done) => {
    const fixture = TestBed.createComponent(ProductsListComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;

    const sub = comp.products$.subscribe((products) => {
      expect(products).toEqual([
        {
          id: "1",
          name: "P1",
          description: null,
          price: 10,
          quantity: 2,
        },
      ]);
      sub.unsubscribe();
      done();
    });

    valueChanges$.next({
      loading: false,
      data: { products: [{ id: 1, name: "P1", price: 10, quantity: 2 }] },
    });
  });

  it("refresh should call refetch and clear error", async () => {
    const fixture = TestBed.createComponent(ProductsListComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.error = "old error";

    comp.refresh();

    expect(comp.error).toBeNull();
    expect(queryRefMock.refetch).toHaveBeenCalledTimes(1);
  });

  it("createProduct should fail validation when name < 2 chars", () => {
    const fixture = TestBed.createComponent(ProductsListComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.form.name = "a";

    comp.createProduct();

    expect(comp.errorCreate).toBe("Validation error: name");
    expect(comp.loadingCreate).toBe(false);
    expect(apolloMock.mutate).not.toHaveBeenCalled();
  });

  it("createProduct should call mutate and reset form on success", () => {
    const fixture = TestBed.createComponent(ProductsListComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;

    apolloMock.mutate.mockReturnValue(of({ data: { createProduct: { id: "1" } } }));

    comp.form = { name: " New ", description: "d", price: 12, quantity: 3 };
    comp.createProduct();

    expect(apolloMock.mutate).toHaveBeenCalledTimes(1);
    expect(comp.loadingCreate).toBe(false);
    expect(comp.form.name).toBe(""); // reset form
  });

  it("saveEdit should fail validation when name < 2 chars", () => {
    const fixture = TestBed.createComponent(ProductsListComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.editingId = "1";
    comp.editForm.name = "a";

    comp.saveEdit();

    expect(comp.errorUpdate).toBe("Validation error: name");
    expect(apolloMock.mutate).not.toHaveBeenCalled();
  });

  it("deleteProduct should not call mutate if confirm is false", () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);

    const fixture = TestBed.createComponent(ProductsListComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.deleteProduct("1");

    expect(apolloMock.mutate).not.toHaveBeenCalled();
  });

  it("deleteProduct should set forbidden error message when backend says forbidden", (done) => {
    jest.spyOn(window, "confirm").mockReturnValue(true);

    // mutate returns observable that errors
    apolloMock.mutate.mockReturnValue(
      throwError(() => ({ message: "Forbidden" }))
    );

    const fixture = TestBed.createComponent(ProductsListComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;

    comp.deleteProduct("1");

    // wait microtask queue
    setTimeout(() => {
      expect(comp.error).toBe("You are not allowed to delete products");
      expect(comp.loadingDeleteId).toBeNull(); // finalize resets it
      done();
    }, 0);
  });
});
