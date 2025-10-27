// This component should ONLY be used in the discount reports tab
export function DiscountCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Sample discount cards for demonstration */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-lg">10% Off</h3>
        <p className="text-sm text-muted-foreground">For new customers</p>
        <p className="mt-2 text-sm">Valid until December 31, 2023</p>
        <button className="mt-3 text-sm border rounded px-3 py-1">View Details</button>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-lg">Buy One Get One</h3>
        <p className="text-sm text-muted-foreground">On selected items</p>
        <p className="mt-2 text-sm">Valid until November 15, 2023</p>
        <button className="mt-3 text-sm border rounded px-3 py-1">View Details</button>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-lg">Free Delivery</h3>
        <p className="text-sm text-muted-foreground">On orders over $50</p>
        <p className="mt-2 text-sm">Valid until January 15, 2024</p>
        <button className="mt-3 text-sm border rounded px-3 py-1">View Details</button>
      </div>
    </div>
  )
}
