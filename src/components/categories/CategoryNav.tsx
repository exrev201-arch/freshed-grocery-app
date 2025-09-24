import { categories } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CategoryNavProps {
    selectedCategory: string | null
    onCategorySelect: (categoryId: string | null) => void
}

function CategoryNav({ selectedCategory, onCategorySelect }: CategoryNavProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Categories</h2>
                <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => onCategorySelect(null)}
                >
                    All Products
                </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {categories.map((category) => (
                    <Card
                        key={category.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedCategory === category.id
                                ? 'ring-2 ring-primary shadow-lg'
                                : 'hover:ring-1 hover:ring-border'
                            }`}
                        onClick={() => onCategorySelect(category.id)}
                    >
                        <div className="p-4 text-center space-y-2">
                            <div className="text-2xl">{category.icon}</div>
                            <h3 className="text-sm font-medium leading-tight">{category.name}</h3>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default CategoryNav