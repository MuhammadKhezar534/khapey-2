import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Discount } from "@/types/discounts";
import { handleError } from "@/lib/error-handling";

// Mock database for demo
let discounts: Discount[] = [];

/**
 * Helper function to validate discount data
 * @param {Partial<Discount>} discount - The discount data to validate
 * @returns {{ isValid: boolean; error?: string; errors?: string[] }} - An object indicating whether the discount data is valid and any errors
 */
function validateDiscount(discount: Partial<Discount>): {
  isValid: boolean;
  error?: string;
  errors?: string[];
} {
  if (!discount.type) {
    return { isValid: false, error: "Missing discount type" };
  }

  if (!discount.name && !discount.title) {
    return { isValid: false, error: "Missing name or title" };
  }

  return { isValid: true };
}

/**
 * API endpoint to get all discounts
 * @param {NextRequest} request - The Next.js request object
 * @returns {NextResponse} - The Next.js response object
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters for filtering
    const url = new URL(request.url);
    const branch = url.searchParams.get("branch") || undefined;
    const status = url.searchParams.get("status") as
      | "active"
      | "inactive"
      | undefined;
    const type = url.searchParams.get("type") as
      | "loyalty"
      | "percentageDeal"
      | "bankDiscount"
      | undefined;

    // Filter discounts
    let filteredDiscounts = [...discounts];

    if (branch) {
      filteredDiscounts = filteredDiscounts.filter(
        (d) => d.applyToAllBranches || d.branches.includes(branch)
      );
    }

    if (status) {
      filteredDiscounts = filteredDiscounts.filter((d) => d.status === status);
    }

    if (type) {
      filteredDiscounts = filteredDiscounts.filter((d) => d.type === type);
    }

    // Create response with caching headers
    const response = NextResponse.json({ discounts: filteredDiscounts });

    // Add cache control headers - cache for 5 minutes
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=60"
    );

    return response;
  } catch (error) {
    console.error("Error in discounts API:", error);
    const appError = handleError(error, "Failed to fetch discounts");
    return new Response(
      JSON.stringify({
        error: appError.message,
        type: appError.type,
        details: appError.details,
      }),
      { status: appError.statusCode || 500 }
    );
  }
}

/**
 * API endpoint to create a new discount
 * @param {NextRequest} request - The Next.js request object
 * @returns {NextResponse} - The Next.js response object
 */
export async function POST(request: NextRequest) {
  try {
    const newDiscount = (await request.json()) as Discount;

    // Validate the discount has required fields
    const validation = validateDiscount(newDiscount);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          validationErrors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Generate an ID if not provided
    if (!newDiscount.id) {
      newDiscount.id = `discount-${Date.now()}`;
    }

    // Set timestamps
    const now = new Date().toISOString();
    newDiscount.createdAt = now;
    newDiscount.updatedAt = now;

    // Handle loyalty program rule (only one active loyalty program allowed)
    if (newDiscount.type === "loyalty" && newDiscount.status === "active") {
      // Set all other loyalty programs to inactive
      discounts = discounts.map((d) =>
        d.type === "loyalty" && d.status === "active"
          ? { ...d, status: "inactive", updatedAt: now }
          : d
      );
    }

    // Add the new discount
    discounts.push(newDiscount);

    return NextResponse.json(
      {
        success: true,
        discount: newDiscount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in discounts API:", error);
    const appError = handleError(error, "Failed to create discount");
    return new Response(
      JSON.stringify({
        error: appError.message,
        type: appError.type,
        details: appError.details,
      }),
      { status: appError.statusCode || 500 }
    );
  }
}

/**
 * API endpoint to update an existing discount
 * @param {NextRequest} request - The Next.js request object
 * @returns {NextResponse} - The Next.js response object
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    const updatedDiscount = body as Discount;

    // Validate the discount has required fields
    const validation = validateDiscount(updatedDiscount);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Find the discount to update
    const index = discounts.findIndex((d) => d.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      );
    }

    // Update timestamps
    updatedDiscount.updatedAt = new Date().toISOString();

    // Handle loyalty program rule (only one active loyalty program allowed)
    if (
      updatedDiscount.type === "loyalty" &&
      updatedDiscount.status === "active"
    ) {
      // Set all other loyalty programs to inactive
      discounts = discounts.map((d) =>
        d.type === "loyalty" &&
        d.status === "active" &&
        d.id !== updatedDiscount.id
          ? { ...d, status: "inactive", updatedAt: new Date().toISOString() }
          : d
      );
    }

    // Update the discount
    discounts[index] = updatedDiscount;

    return NextResponse.json({ discount: updatedDiscount });
  } catch (error) {
    console.error("Error in discounts API:", error);
    const appError = handleError(error, "Failed to update discount");
    return new Response(
      JSON.stringify({
        error: appError.message,
        type: appError.type,
        details: appError.details,
      }),
      { status: appError.statusCode || 500 }
    );
  }
}

/**
 * API endpoint to delete an existing discount
 * @param {NextRequest} request - The Next.js request object
 * @returns {NextResponse} - The Next.js response object
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing discount ID" },
        { status: 400 }
      );
    }

    const initialLength = discounts.length;
    discounts = discounts.filter((d) => d.id !== id);

    if (discounts.length === initialLength) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in discounts API:", error);
    const appError = handleError(error, "Failed to delete discount");
    return new Response(
      JSON.stringify({
        error: appError.message,
        type: appError.type,
        details: appError.details,
      }),
      { status: appError.statusCode || 500 }
    );
  }
}
