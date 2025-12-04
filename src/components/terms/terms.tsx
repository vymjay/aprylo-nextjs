import React from 'react';

export default function TermsOfService() {
  return (
    <main className="max-w-4xl mx-auto p-8 bg-gray-50 rounded-lg shadow-md font-sans text-gray-800">
      <h1 className="text-4xl font-extrabold mb-6 text-gray-900 border-b-4 border-pink-500 pb-2 tracking-wide">
        Terms of Service
      </h1>

      <p className="mb-4">
        Welcome to VB Cart. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions.
      </p>

      <h2 className="text-2xl font-semibold mb-3 mt-6">Use of Our Website</h2>
      <p className="mb-4">
        You agree to use the website for lawful purposes only. You shall not engage in any activity that may disrupt or interfere with the website’s operation.
      </p>

      <h2 className="text-2xl font-semibold mb-3 mt-6">Product Information</h2>
      <p className="mb-4">
        We strive to provide accurate product descriptions and pricing. However, we do not guarantee that all information is error-free or complete.
      </p>

      <h2 className="text-2xl font-semibold mb-3 mt-6">Order and Payment</h2>
      <p className="mb-4">
        By placing an order, you agree to provide current, complete, and accurate information. We reserve the right to refuse or cancel orders at our discretion.
      </p>

      <h2 className="text-2xl font-semibold mb-3 mt-6">Intellectual Property</h2>
      <p className="mb-4">
        All content on the website, including text, images, logos, and designs, is the property of VB Cart or its licensors and is protected by intellectual property laws.
      </p>

      <h2 className="text-2xl font-semibold mb-3 mt-6">Limitation of Liability</h2>
      <p className="mb-4">
        VB Cart shall not be liable for any damages arising from the use or inability to use the website or products purchased.
      </p>

      <h2 className="text-2xl font-semibold mb-3 mt-6">Changes to Terms</h2>
      <p className="mb-4">
        We reserve the right to update or modify these terms at any time. Continued use of the website signifies acceptance of the revised terms.
      </p>

      <h2 className="text-2xl font-semibold mb-3 mt-6">Contact Us</h2>
      <p>
        If you have any questions about these Terms of Service, please contact us at{' '}
        <a href="mailto:support@vbcart.com" className="text-pink-600 underline">
          support@vbcart.com
        </a>.
      </p>

      <p className="mt-10 text-sm text-gray-500 italic">
        All images used on this site are sourced from open source/free-to-use collections.
      </p>
    </main>
  );
}