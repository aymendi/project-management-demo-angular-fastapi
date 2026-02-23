import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Apollo, QueryRef } from 'apollo-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, shareReplay } from 'rxjs/operators';
import { finalize, timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Observable } from 'rxjs';

import { TranslateModule } from '@ngx-translate/core';

import {
  PRODUCTS_QUERY,
  CREATE_PRODUCT_MUTATION,
  UPDATE_PRODUCT_MUTATION,
  DELETE_PRODUCT_MUTATION,
} from '../../graphql/products.gql';

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
};

type ProductsQueryResult = { products: Array<Partial<Product>> };

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ 'PRODUCTS' | translate }}</h1>

        <button
          class="px-4 py-2 rounded bg-zinc-800 text-white hover:bg-zinc-700"
          (click)="refresh()"
        >
          {{ 'REFRESH' | translate }}
        </button>
      </div>

      <!-- Create product -->
      <div class="p-4 rounded border border-zinc-200 space-y-3 max-w-xl">
        <h2 class="font-semibold">{{ 'ADD_PRODUCT' | translate }}</h2>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            class="border rounded px-3 py-2"
            [placeholder]="'NAME' | translate"
            [(ngModel)]="form.name"
          />
          <input
            class="border rounded px-3 py-2"
            [placeholder]="'DESCRIPTION_OPT' | translate"
            [(ngModel)]="form.description"
          />
          <input
            class="border rounded px-3 py-2"
            type="number"
            [placeholder]="'PRICE' | translate"
            [(ngModel)]="form.price"
          />
          <input
            class="border rounded px-3 py-2"
            type="number"
            [placeholder]="'QUANTITY' | translate"
            [(ngModel)]="form.quantity"
          />
        </div>

        <button
          class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
          (click)="createProduct()"
          [disabled]="loadingCreate || !form.name"
        >
          {{ loadingCreate ? ('CREATING' | translate) : ('CREATE' | translate) }}
        </button>

        <p *ngIf="errorCreate" class="text-red-600 text-sm">{{ errorCreate }}</p>
      </div>

      <!-- List -->
      <div class="rounded border border-zinc-200 overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-zinc-50">
            <tr>
              <th class="p-3">ID</th>
              <th class="p-3">{{ 'NAME' | translate }}</th>
              <th class="p-3">{{ 'PRICE' | translate }}</th>
              <th class="p-3">{{ 'QUANTITY' | translate }}</th>
              <th class="p-3">{{ 'ACTIONS' | translate }}</th>
            </tr>
          </thead>

          <tbody>
            <tr
              *ngIf="(loading$ | async) && (productsCount$ | async) === 0"
              class="border-t"
            >
              <td class="p-3" colspan="5">{{ 'LOADING' | translate }}</td>
            </tr>

            <tr
              *ngIf="!(loading$ | async) && (productsCount$ | async) === 0"
              class="border-t"
            >
              <td class="p-3" colspan="5">{{ 'NO_PRODUCTS' | translate }}</td>
            </tr>

            <tr *ngFor="let p of (products$ | async) ?? []" class="border-t">
              <td class="p-3">{{ p.id }}</td>

              <!-- Name -->
              <td class="p-3">
                <ng-container *ngIf="editingId === p.id; else nameView">
                  <input
                    class="border rounded px-2 py-1 w-full"
                    [(ngModel)]="editForm.name"
                  />
                </ng-container>
                <ng-template #nameView>{{ p.name }}</ng-template>
              </td>

              <!-- Price -->
              <td class="p-3">
                <ng-container *ngIf="editingId === p.id; else priceView">
                  <input
                    class="border rounded px-2 py-1 w-32"
                    type="number"
                    [(ngModel)]="editForm.price"
                  />
                </ng-container>
                <ng-template #priceView>{{ p.price }}</ng-template>
              </td>

              <!-- Quantity -->
              <td class="p-3">
                <ng-container *ngIf="editingId === p.id; else qtyView">
                  <input
                    class="border rounded px-2 py-1 w-24"
                    type="number"
                    [(ngModel)]="editForm.quantity"
                  />
                </ng-container>
                <ng-template #qtyView>{{ p.quantity }}</ng-template>
              </td>

              <!-- Actions -->
              <td class="p-3">
                <ng-container *ngIf="editingId === p.id; else normalActions">
                  <button
                    class="px-3 py-1 rounded bg-green-600 text-white disabled:opacity-50"
                    (click)="saveEdit()"
                    [disabled]="loadingUpdate"
                  >
                    {{
                      loadingUpdate
                        ? ('SAVING' | translate)
                        : ('SAVE' | translate)
                    }}
                  </button>

                  <button
  class="px-3 py-1 rounded bg-zinc-200 text-zinc-900 ml-2
         dark:bg-zinc-700 dark:text-zinc-100
         hover:bg-zinc-300 dark:hover:bg-zinc-600"
  (click)="cancelEdit()"
>
  {{ 'CANCEL' | translate }}
</button>

                  <p *ngIf="errorUpdate" class="text-red-600 text-xs mt-2">
                    {{ errorUpdate }}
                  </p>
                </ng-container>

                <ng-template #normalActions>
                <button
                  class="px-3 py-1 rounded bg-zinc-200 text-zinc-900
                    dark:bg-zinc-700 dark:text-zinc-100
                  hover:bg-zinc-300 dark:hover:bg-zinc-600"
                   (click)="startEdit(p)" 
                    >
                    
                   {{ 'EDIT' | translate }}
              </button>

                  <button
                    class="px-3 py-1 rounded bg-red-600 text-white ml-2 disabled:opacity-50"
                    (click)="deleteProduct(p.id)"
                    [disabled]="loadingDeleteId === p.id"
                  >
                    {{
                      loadingDeleteId === p.id
                        ? ('DELETING' | translate)
                        : ('DELETE' | translate)
                    }}
                  </button>
                </ng-template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p *ngIf="error" class="text-red-600 text-sm">{{ error }}</p>
    </div>
  `,
})
export class ProductsListComponent implements OnInit {
  private apollo = inject(Apollo);
  private destroyRef = inject(DestroyRef);

  private productsQuery!: QueryRef<ProductsQueryResult>;

  products$!: Observable<Product[]>;
  loading$!: Observable<boolean>;
  productsCount$!: Observable<number>;

  error: string | null = null;

  form = { name: '', description: null as string | null, price: 0, quantity: 0 };
  loadingCreate = false;
  errorCreate: string | null = null;

  editingId: string | null = null;
  editForm = { name: '', description: null as string | null, price: 0, quantity: 0 };
  loadingUpdate = false;
  errorUpdate: string | null = null;

  loadingDeleteId: string | null = null;

  ngOnInit(): void {
    this.productsQuery = this.apollo.watchQuery<ProductsQueryResult>({
      query: PRODUCTS_QUERY,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: true,
    });

    this.loading$ = this.productsQuery.valueChanges.pipe(
      map((r) => r.loading),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.products$ = this.productsQuery.valueChanges.pipe(
      map(({ data }) => {
        const list = data?.products ?? [];
        return list
          .filter((p): p is Product => !!p.id && !!p.name)
          .map((p) => ({
            id: String(p.id),
            name: p.name!,
            description: (p as any).description ?? null,
            price: Number(p.price ?? 0),
            quantity: Number(p.quantity ?? 0),
          }));
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.productsCount$ = this.products$.pipe(map((arr) => arr.length));
  }

  refresh(): void {
    this.error = null;
    this.productsQuery.refetch().catch((err) => {
      this.error = err?.message ?? 'Failed to load products';
    });
  }

  createProduct(): void {
    this.loadingCreate = true;
    this.errorCreate = null;

    const name = this.form.name.trim();
    if (name.length < 2) {
      this.errorCreate = 'Validation error: name';
      this.loadingCreate = false;
      return;
    }

    this.apollo
      .mutate<{ createProduct: Product }>({
        mutation: CREATE_PRODUCT_MUTATION,
        variables: {
          input: {
            name,
            description: this.form.description,
            price: Number(this.form.price),
            quantity: Number(this.form.quantity),
          },
        },
        refetchQueries: [{ query: PRODUCTS_QUERY }],
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.form = { name: '', description: null, price: 0, quantity: 0 };
          this.loadingCreate = false;
        },
        error: (err) => {
          this.errorCreate = err?.message ?? 'Failed to create product';
          this.loadingCreate = false;
        },
      });
  }

  startEdit(p: Product) {
    this.editingId = p.id;
    this.errorUpdate = null;
    this.editForm = {
      name: p.name,
      description: p.description ?? null,
      price: p.price,
      quantity: p.quantity,
    };
  }

  cancelEdit() {
    this.editingId = null;
    this.errorUpdate = null;
  }

  saveEdit() {
    if (!this.editingId) return;

    const name = this.editForm.name.trim();
    if (name.length < 2) {
      this.errorUpdate = 'Validation error: name';
      return;
    }

    this.loadingUpdate = true;
    this.errorUpdate = null;

    this.apollo
      .mutate<{ updateProduct: Product }>({
        mutation: UPDATE_PRODUCT_MUTATION,
        variables: {
          id: this.editingId,
          input: {
            name,
            description: this.editForm.description,
            price: Number(this.editForm.price),
            quantity: Number(this.editForm.quantity),
          },
        },
        refetchQueries: [{ query: PRODUCTS_QUERY }],
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadingUpdate = false;
          this.editingId = null;
        },
        error: (err) => {
          this.loadingUpdate = false;
          this.errorUpdate = err?.message ?? 'Failed to update product';
        },
      });
  }

  deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;

  this.loadingDeleteId = id;
  this.error = null;

  this.apollo
    .mutate<{ deleteProduct: boolean }>({
      mutation: DELETE_PRODUCT_MUTATION,
      variables: { id },
      refetchQueries: [{ query: PRODUCTS_QUERY }],
    })
    .pipe(
      timeout(8000), // if backend doesn't respond in 8s -> error
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => {
        this.loadingDeleteId = null; // always reset
      })
    )
    .subscribe({
      next: (res) => {
        // optional: if backend returns false
        if (res.data?.deleteProduct === false) {
          this.error = 'Delete was rejected by the server';
        }
      },
      error: (err) => {
        const msg = err?.message ?? '';
        if (msg.toLowerCase().includes('forbidden')) {
           this.error = 'You are not allowed to delete products';
          } else {
            this.error = msg || 'Failed to delete product';
          }

      },
    });
  }
}
