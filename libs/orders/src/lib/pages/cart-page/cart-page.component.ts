import { takeUntil } from 'rxjs/operators';
import { CartItemDetailed } from './../../models/cart';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartService, OrdersService } from '@maddoxx/orders';
import { Subject } from 'rxjs';

@Component({
  selector: 'orders-cart-page',
  templateUrl: './cart-page.component.html',
  styles: []
})
export class CartPageComponent implements OnInit, OnDestroy {
  cartItemsDetailed: CartItemDetailed[] = [];
  cartCount = 0;
  endSubs$: Subject<any> = new Subject();

  constructor(
    private router: Router,
    private cartService: CartService,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    this._getCartDetails();
  }

  private _getCartDetails() {
    this.cartService.cart$.pipe(takeUntil(this.endSubs$)).subscribe((responseCart) => {
      this.cartItemsDetailed = [];
      this.cartCount = responseCart?.items?.length ?? 0;
      responseCart.items.forEach((cartItem) => {
        this.ordersService.getProduct(cartItem.productId).subscribe((resProduct) => {
          this.cartItemsDetailed.push({
            product: resProduct,
            quantity: cartItem.quantity
          });
        });
      });
    });
  }

  backToShop() {
    this.router.navigate(['/products']);
  }

  deleteCartItem(cartItem: CartItemDetailed) {
    this.cartService.deleteCartItem(cartItem.product.id);
  }

  updateCartItemQuantity(event, cartItem: CartItemDetailed) {
    this.cartService.setCartItem({ productId: cartItem.product.id, quantity: event.value }, true);
  }

  ngOnDestroy(): void {
    this.endSubs$.next();
    this.endSubs$.complete();
  }
}
