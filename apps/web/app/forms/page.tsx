import {
  ArrayForm,
  BasicForm,
  CheckboxForm,
  ComplexForm,
  RadioForm,
  SelectForm,
  SwitchForm,
} from "@/components/forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/design-system";

export default function FormsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">React Hook Form Examples</h1>
          <p className="text-muted-foreground">
            Examples of forms built with React Hook Form, Zod validation, and
            Shadcn UI components.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Complex Form</CardTitle>
              <CardDescription>
                A comprehensive form demonstrating multiple field types,
                validation, and sections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComplexForm />
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
              <BasicForm />
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
              <SelectForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Checkbox Group</CardTitle>
              <CardDescription>
                Form with multiple checkbox options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CheckboxForm />
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
              <RadioForm />
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
              <SwitchForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Array Fields</CardTitle>
              <CardDescription>
                Dynamic form with add/remove functionality using useFieldArray.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArrayForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
