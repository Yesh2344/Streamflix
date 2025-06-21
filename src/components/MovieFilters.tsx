interface MovieFiltersProps {
  sortBy: string;
  setSortBy: (sort: string) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  yearRange: [number, number];
  setYearRange: (range: [number, number]) => void;
}

export function MovieFilters({
  sortBy,
  setSortBy,
  minRating,
  setMinRating,
  yearRange,
  setYearRange,
}: MovieFiltersProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold mb-3">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-red-600 text-white"
          >
            <option value="title">Title</option>
            <option value="rating">Rating</option>
            <option value="year">Release Year</option>
          </select>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Minimum Rating: {minRating > 0 ? minRating.toFixed(1) : "Any"}
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={minRating}
            onChange={(e) => setMinRating(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Year Range */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Year Range: {yearRange[0]} - {yearRange[1]}
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              min="1900"
              max="2024"
              value={yearRange[0]}
              onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-red-600 text-white text-sm"
            />
            <span className="text-gray-400 self-center">-</span>
            <input
              type="number"
              min="1900"
              max="2024"
              value={yearRange[1]}
              onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-red-600 text-white text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
