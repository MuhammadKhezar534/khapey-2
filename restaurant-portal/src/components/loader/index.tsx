import React, { Fragment } from "react";

type LoaderProps = {
  loading: boolean;
};

const Loader: React.FC<LoaderProps> = ({ loading }) => {
  return (
    <Fragment>
      {loading && (
        <div className="fixed inset-0 z-[9999] bg-white/80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
        </div>
      )}
    </Fragment>
  );
};

export default Loader;
