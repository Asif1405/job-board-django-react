import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { useRegister } from "./useAuth";

const schema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email"),
    role: z.enum(["candidate", "employer"] as const),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirm: z.string(),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { mutate: register_, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "candidate" },
  });

  const role = watch("role");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <Briefcase className="h-7 w-7 text-primary" />
            JobBoard
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Join thousands of job seekers and employers</CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit((data) => register_(data))}
              className="space-y-4"
            >
              {/* Role selector */}
              <div className="grid grid-cols-2 gap-2 rounded-lg border p-1">
                {(["candidate", "employer"] as const).map((r) => (
                  <label
                    key={r}
                    className={`flex cursor-pointer items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      role === r
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <input type="radio" value={r} {...register("role")} className="sr-only" />
                    {r === "candidate" ? "Job Seeker" : "Employer"}
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First name"
                  placeholder="Jane"
                  error={errors.first_name?.message}
                  {...register("first_name")}
                />
                <Input
                  label="Last name"
                  placeholder="Doe"
                  error={errors.last_name?.message}
                  {...register("last_name")}
                />
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                hint="At least 8 characters"
                {...register("password")}
              />
              <Input
                label="Confirm password"
                type="password"
                placeholder="••••••••"
                error={errors.password_confirm?.message}
                {...register("password_confirm")}
              />

              <Button type="submit" className="w-full" loading={isPending}>
                Create account
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-sm text-muted-foreground">
            Already have an account?&nbsp;
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
