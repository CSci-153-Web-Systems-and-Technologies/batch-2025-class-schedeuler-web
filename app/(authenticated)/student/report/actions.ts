// app/(authenticated)/student/report/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server';
import nodemailer from 'nodemailer';

const RATE_LIMIT_MINUTES = 10;

export async function submitBugReport(formData: {
  subject: string;
  category: string;
  message: string;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to submit a report." };
  }

  const { data: lastReport, error: fetchError } = await supabase
    .from('reports')
    .select('created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (lastReport) {
    const lastDate = new Date(lastReport.created_at);
    const now = new Date();
    const diffInMinutes = (now.getTime() - lastDate.getTime()) / 1000 / 60;

    if (diffInMinutes < RATE_LIMIT_MINUTES) {
      const waitTime = Math.ceil(RATE_LIMIT_MINUTES - diffInMinutes);
      return { 
        error: `Please wait ${waitTime} minute(s) before sending another report.` 
      };
    }
  }

  const { error: dbError } = await supabase
    .from('reports')
    .insert({
      user_id: user.id,
      subject: formData.subject,
      category: formData.category,
      message: formData.message
    });

  if (dbError) {
    console.error("Database Error:", dbError);
    return { error: "Failed to log report. Please try again." };
  }
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("❌ MISSING ENV VARIABLES: Make sure GMAIL_USER and GMAIL_APP_PASSWORD are in .env.local");
      throw new Error("Server misconfiguration: Missing email credentials.");
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await new Promise((resolve, reject) => {
        transporter.verify(function (error, success) {
            if (error) {
                console.error("❌ NODEMAILER CONNECTION ERROR:", error);
                reject(error);
            } else {
                console.log("✅ Nodemailer is ready to take our messages");
                resolve(success);
            }
        });
    });

    const mailOptions = {
      from: `"SchedEuler App" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, 
      subject: `[${formData.category.toUpperCase()}] ${formData.subject}`,
      html: `
        <h3>New Report Received</h3>
        <p><strong>From User ID:</strong> ${user.id}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Category:</strong> ${formData.category}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${formData.message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to", process.env.GMAIL_USER);

    return { success: true };

  } catch (emailError: any) {
    console.error("❌ EMAIL SENDING FAILED:", emailError.message);
    return { 
      success: true, 
      warning: "Report saved to database, but email notification failed. Check server logs." 
    };
  }
}