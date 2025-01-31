import { FC, ReactElement } from 'react';

const Testimonials: FC = (): ReactElement => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Testimonials</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Trusted by data teams everywhere</p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center">
                <img
                  className="h-12 w-12 rounded-full"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Sarah Wilson"
                />
                <div className="ml-4">
                  <h4 className="text-lg font-bold">Sarah Wilson</h4>
                  <p className="text-gray-500">Data Analyst, TechCorp</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "DataViz has transformed how we analyze and present our data. The AI-powered insights have helped us
                discover patterns we never knew existed."
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center">
                <img
                  className="h-12 w-12 rounded-full"
                  src="https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Michael Chen"
                />
                <div className="ml-4">
                  <h4 className="text-lg font-bold">Michael Chen</h4>
                  <p className="text-gray-500">BI Manager, FinanceHub</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "The natural language interface makes it incredibly easy for our team to create complex visualizations
                without writing any code."
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center">
                <img
                  className="h-12 w-12 rounded-full"
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="David Kumar"
                />
                <div className="ml-4">
                  <h4 className="text-lg font-bold">David Kumar</h4>
                  <p className="text-gray-500">CEO, DataStart</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "We've reduced our reporting time by 80% since implementing DataViz. The automated insights have become
                crucial for our decision-making process."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
