
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react'; // For loading spinner

// Define the validation schema using Zod
const profileSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required." }),
  email: z.string().email().optional(), // Email is read-only, but include for structure
  phoneNumber: z.string().optional(), // Phone number is optional
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileSettings = () => {
  const { user, updateProfile, isLoading: isAuthLoading } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
    },
  });

  // Populate form with user data once available
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        phoneNumber: user.user_metadata?.phone || '',
      });
    }
  }, [user, form.reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    // Only send name and phone for update
    await updateProfile({
      name: data.fullName,
      phone: data.phoneNumber,
      // We don't update email here as it's more complex (requires verification)
      // If email update is needed, it should be handled separately
    });
    // AuthContext handles success/error toasts
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal details.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" disabled placeholder="Your email address" />
                  </FormControl>
                  <FormDescription>
                    Email address cannot be changed here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="Your phone number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isAuthLoading}>
              {isAuthLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ProfileSettings;
