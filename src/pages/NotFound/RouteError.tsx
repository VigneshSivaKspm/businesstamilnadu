import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

/** Top-level error boundary for routing and render errors. */
export function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const isChunkError = error instanceof Error && /dynamically imported module|Loading chunk/i.test(error.message);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="main" className="flex flex-1 items-center bg-white">
        <Container size="narrow" className="py-24 text-center">
          <p className="text-label text-brand-600">{notFound ? 'Error 404' : 'Something went wrong'}</p>
          <h1 className="text-h1 mt-3">{notFound ? 'Page Not Found' : 'We hit an unexpected problem'}</h1>
          <p className="text-body mx-auto mt-4 max-w-lg text-navy-500">
            {isChunkError
              ? 'A newer version of the site is available. Reload the page to continue.'
              : 'Please try again. If the problem continues, contact our support team.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Reload page
            </Button>
            <Button href="/" variant="secondary">
              Go Home
            </Button>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
