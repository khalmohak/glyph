import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@glyphui/ui'

export default function Example() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Engineering</BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>GLY-142</BreadcrumbPage>
          <Badge tone="warning" dot>
            In progress
          </Badge>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
