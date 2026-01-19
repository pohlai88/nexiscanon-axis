import {
  ArrayTanStackForm,
  BasicTanStackForm,
  CheckboxTanStackForm,
  ComplexTanStackForm,
  RadioTanStackForm,
  SelectTanStackForm,
  SwitchTanStackForm,
} from "@/components/forms-tanstack";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/design-system";

export default function TanStackFormsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">TanStack Form Examples</h1>
          <p className="text-muted-foreground">
            Examples of forms built with TanStack Form, Zod validation, and
            Shadcn UI components.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Complex Form</CardTitle>
              <CardDescription>
                A comprehensive form demonstrating multiple field types,
                validation, and sections with real-time validation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComplexTanStackForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Basic Form</CardTitle>
              <CardDescription>
                A simple form with text input and textarea fields.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BasicTanStackForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Field</CardTitle>
              <CardDescription>
                Form with a select dropdown field.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SelectTanStackForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Checkbox Group</CardTitle>
              <CardDescription>
                Form with multiple checkbox options using array mode.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CheckboxTanStackForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Radio Group</CardTitle>
              <CardDescription>
                Form with radio button selection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioTanStackForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Switch Fields</CardTitle>
              <CardDescription>
                Form with toggle switches for boolean settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SwitchTanStackForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Array Fields</CardTitle>
              <CardDescription>
                Dynamic form with add/remove functionality using array mode.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArrayTanStackForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
