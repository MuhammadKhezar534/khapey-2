interface BreakdownItem {
  count: number;
  branchName: string;
}

interface InputData {
  total: number;
  breakdown: BreakdownItem[];
}

interface OutputItem {
  name: string;
  value: number;
  percent: number;
}

export const transformBreakdownToPercentArray = (
  data: InputData
): OutputItem[] => {
  const { total, breakdown } = data;

  return breakdown.map((item) => ({
    name: item.branchName,
    value: item.count,
    percent: Math.round((item.count / total) * 100),
  }));
};

export const getBreakDownDataByResponse = (data: any) => {
  if (data) {
    return {
      discounts: transformBreakdownToPercentArray(
        data?.discount_distribution || {}
      ),
      revenue: transformBreakdownToPercentArray(
        data?.revenue_distribution || {}
      ),
      reviews: transformBreakdownToPercentArray(
        data?.review_distribution || {}
      ),
    };
  } else null;
};

type BranchDataInput = Record<
  string,
  {
    branchName: string;
    total_reviews: number;
    average_rating: number;
    views: number;
    likes: number;
    saves: number;
    shares: number;
    revenue: number;
  }
>;

// type values = {
//   total_likes: number;
//   total_revenue: number;
//   total_reviews: number;
//   total_saves: number;
//   total_shares: number;
//   total_views: number;
// };

export const transformBranchData = (data: BranchDataInput) => {
  if (data) {
    const branches = Object.values(data);

    const totals = {
      reviews: 0,
      views: 0,
      likes: 0,
      revenue: 0,
      saves: 0,
      shares: 0,
      discount: 0,
    };

    branches.forEach((branch) => {
      totals.reviews += branch.total_reviews;
      totals.views += branch.views;
      totals.likes += branch.likes;
      totals.revenue += branch.revenue;
      totals.saves += branch.saves;
      totals.shares += branch.shares;
      totals.discount += branch.revenue * 0.2;
    });

    const branchesData = branches?.map((branch) => {
      const totalDiscount = Math.round(branch.revenue * 0.2);

      return {
        branch: branch?.branchName,
        reviews: branch?.total_reviews,
        views: branch?.views,
        likes: branch?.likes,
        revenue: branch?.revenue,
        saves: branch?.saves,
        shares: branch?.shares,
        rating: parseFloat(branch?.average_rating?.toFixed(1)),
        totalDiscount,
        reviewsPercent:
          Math.round((branch.total_reviews / totals.reviews) * 100) || 0,
        viewsPercent: Math.round((branch.views / totals.views) * 100) || 0,
        likesPercent: Math.round((branch.likes / totals.likes) * 100) || 0,
        revenuePercent:
          Math.round((branch.revenue / totals.revenue) * 100) || 0,
        savesPercent: Math.round((branch.saves / totals.saves) * 100) || 0,
        sharesPercent: Math.round((branch.shares / totals.shares) * 100) || 0,
        discountPercent: Math.round(
          (totalDiscount / (totals.revenue * 0.2)) * 100
        ),
      };
    });

    return { branchesData, data };
  } else return data;
};

export const getToken = (): string | null => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.token || null;
  } catch {
    return null;
  }
};
