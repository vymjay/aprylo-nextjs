import ProductForm from '@/components/admin/product-form'

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params

  return <ProductForm productId={id} isEdit={true} />
}
