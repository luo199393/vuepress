### css选择器

``` css
<style>
/* 第一个 */
.item:first-child {
  ...
}

/* 非第一个 */
.item:not(:first-child)

/* 最后一个 */
.item:last-child

/* 非最后一个 */
.item:not(:last-child)

/* 第一个子元素 */
.item:first-child

/* 相同类型子元素中的第一个 */
.item:first-of-type

/* 偶数 */
.item:nth-child(even)

/* 奇数 */
.item:nth-child(odd)

/* 列表中的第三个元素 */
.item:nth-child(3) 

/* 列表中的元素从第3个开始到最后 */
.item:nth-child(n+3) 

/* 列表中从0到3，即小于3的元素 */
.item:nth-child(-n+3) 

/* 列表中倒数第三个元素 */
.item:nth-last-child(3)
</style>